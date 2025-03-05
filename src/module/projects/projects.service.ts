import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createPolicyDTO } from './dto/createPolicy.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectPolicy } from './schema/projectPolicy.schema';
import { Model } from 'mongoose';
import { Project } from './schema/project.schema';
import { CreateProjectDTO } from './dto/createProject.dto';
import { SendGridClient } from 'src/email/sendgrid.client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfirmProjectDTO } from './dto/confirmProject.dto';
import { UsersService } from '../users/users.service';
import { KafkaService } from 'src/kafka/kafka.service';
import { Designation } from 'src/common/enum/designations.enum';
import { AssignMembersDTO } from './dto/assignMembers.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ProjectsService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(ProjectPolicy.name)
    private readonly projectPolicyModel: Model<ProjectPolicy>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly sendGridClient: SendGridClient,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
  ) {
    this.logger = new Logger(ProjectsService.name);
  }

  async getPolicy(budget: number) {
    const lowerPolicy = await this.projectPolicyModel
      .findOne({ budget: { $lte: budget } })
      .sort({ budget: -1 });

    if (!lowerPolicy)
      throw new NotFoundException(
        `No suitable policy found for the given budget`,
      );

    const higherPolicy = await this.projectPolicyModel
      .findOne({ budget: { $gt: lowerPolicy.budget } })
      .sort({ budget: 1 });

    if (higherPolicy && budget >= higherPolicy.budget / 2) {
      return [lowerPolicy, higherPolicy];
    }

    return [lowerPolicy];
  }

  async createPolicy(createPolicyDTO: createPolicyDTO[]) {
    try {
      return await this.projectPolicyModel.create(createPolicyDTO);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async createProject(createProjectDTO: CreateProjectDTO) {
    const projectExists = await this.projectModel.exists({
      projectName: createProjectDTO.projectName,
    });
    if (projectExists) {
      throw new ConflictException(
        `${createProjectDTO.projectName} project already exists.`,
      );
    }

    try {
      const projectQuota = await this.getPolicy(createProjectDTO.projectBudget);
      const project = await this.projectModel.create({
        ...createProjectDTO,
        status: 'Pending',
        budget: createProjectDTO.projectBudget,
      });

      const token = await this.jwtService.signAsync({
        id: project.id,
      });
      await this.redisService.set(`projectToken${project.id}`, token);

      const budgets = projectQuota.map((project) => project.budget);
      const quotations = projectQuota.map((project) =>
        project.quotation.map((quotationMap) =>
          Object.fromEntries(quotationMap as any),
        ),
      );

      await this.sendGridClient.send(
        'clientQuotationsMail.ejs',
        createProjectDTO.clientEmail,
        'Quotations to the client',
        {
          budgets,
          quotations,
          acceptLink: `${this.configService.getOrThrow('FRONTEND_URL')}quotation/accept?token=${token}`,
        },
      );

      return project;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getProject(projectName: string) {
    try {
      var project = await this.projectModel.findOne({ projectName });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
    if (!project)
      throw new NotFoundException(`Project ${projectName} not found.`);

    return project;
  }

  async getProjectInfo(token: string) {
    const { id } = await this.jwtService.decode(token);
    const redisToken = await this.redisService.get(`projectToken${id}`);
    if (!id || !redisToken || id !== redisToken) {
      throw new UnauthorizedException(
        'User is unauthorized to perform this action.',
      );
    }
    try {
      var project = await this.projectModel.findById(id);
      var projectManagers = await this.userService.findByDesignation(
        Designation['Project Manager'],
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
    if (!project) throw new NotFoundException(`Project not found.`);

    const projectQuota = await this.getPolicy(project.budget);
    const projectManagerInfo = projectManagers.map((projectManager) => {
      return {
        id: projectManager.id,
        userName: projectManager.userName,
        phoneNumber: projectManager.phoneNumber,
        email: projectManager.email,
        branch: projectManager.branch,
      };
    });

    return { project, projectQuota, projectManagerInfo };
  }

  async confirmProject(confirmProjectDTO: ConfirmProjectDTO) {
    const { id } = await this.jwtService.decode(confirmProjectDTO.token);
    const redisToken = await this.redisService.get(`projectToken${id}`);
    if (!id || !redisToken || id !== redisToken) {
      throw new UnauthorizedException(
        'User is unauthorized to perform this action.',
      );
    }
    const project = await this.projectModel.exists({ _id: id });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (confirmProjectDTO.projectStatus === 'Declined') {
      const updatedData = await this.projectModel.findOneAndUpdate(
        { _id: id },
        { status: confirmProjectDTO.projectStatus },
        { new: true },
      );
      await this.redisService.delete(`projectToken${id}`);
      return updatedData;
    }

    if (!confirmProjectDTO.projectLead || !confirmProjectDTO.chosenQuotation) {
      throw new BadRequestException();
    }

    const projectLead = await this.userService.findUser(
      confirmProjectDTO.projectLead,
    );

    if (!projectLead) {
      throw new NotFoundException('Project lead not found.');
    }

    const updatedData = await this.projectModel.findOneAndUpdate(
      { _id: id },
      {
        ...confirmProjectDTO,
        projectLead,
        startDate: new Date(),
        status: confirmProjectDTO.projectStatus,
      },
      { new: true },
    );

    await this.kafkaService.produceMessage({
      userId: projectLead.id,
      message: {
        type: 'Project Assigned',
        projectName: updatedData?.projectName,
        proposedDuration: updatedData?.proposedDuration,
        techStack: updatedData?.techStack,
        quotation: updatedData?.chosenQuotation,
        clientEmail: updatedData?.clientEmail,
        description: updatedData?.description,
      },
    });
    await this.redisService.delete(`projectToken${id}`);

    return updatedData;
  }

  async getUsersAccToDesignation() {
    try {
      const users = await this.userService.fetch({
        field: '',
        order: 1,
      });

      const designations = {
        INTERN: Designation['Software Engineering Intern'],
        TRAINEE: Designation['Software Engineer Trainee'],
        ASDE: Designation['Assistant Software Development Engineer'],
        SDE1: Designation['Software Development Engineer 1'],
        SDE2: Designation['Software Development Engineer 2'],
        SDE3: Designation['Software Development Engineer 3'],
        ARCHITECT: Designation['Software Architect'],
      };

      const groupedUsers = Object.keys(designations).reduce(
        (acc, key) => {
          acc[key] = users.filter(
            (user) => user.designation === designations[key],
          );
          return acc;
        },
        {} as Record<string, typeof users>,
      );

      return groupedUsers;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async assignUsers(assignMembersDTO: AssignMembersDTO) {
    const project = await this.projectModel.findOne({
      projectName: assignMembersDTO.projectName,
    });
    if (!project)
      throw new NotFoundException(
        `Project ${assignMembersDTO.projectName} not found.`,
      );

    const users = await Promise.all(
      assignMembersDTO.users.map(async (user) => {
        const userDetails = await Promise.all(
          user.userIDs.map(async (userId) =>
            this.userService.assignProject(project, userId.toString()),
          ),
        );
        return {
          designation: user.designation,
          users: userDetails,
        };
      }),
    );

    const updatedData = await this.projectModel.updateOne(
      { _id: project.id },
      { projectMembers: users },
      { new: true },
    );

    return updatedData;
  }
}
