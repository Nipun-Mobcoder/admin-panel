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

      const budgets = projectQuota.map((project) => project.budget);
      const quotations = projectQuota.map((project) =>
        project.quotation.map((quotationMap) =>
          Object.fromEntries(quotationMap as any),
        ),
      );

      await this.sendGridClient.sendQuotation(
        'clientQuotationsMail.ejs',
        createProjectDTO.clientEmail,
        'Quotations to the client',
        {
          budgets,
          quotations,
          acceptLink: `${this.configService.getOrThrow('FRONTEND_URL')}forgotPassword?token=${token}`,
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
    const token = await this.jwtService.signAsync({
      id: project.id,
    });

    return { project, token };
  }

  async getProjectInfo(token: string) {
    const { id } = await this.jwtService.decode(token);
    if (!id) {
      throw new UnauthorizedException(
        'User is unauthorized to perform this action.',
      );
    }
    try {
      var project = await this.projectModel.findById(id);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
    if (!project) throw new NotFoundException(`Project not found.`);

    const projectQuota = await this.getPolicy(project.budget);

    return { project, projectQuota };
  }

  async confirmProject(confirmProjectDTO: ConfirmProjectDTO) {
    const { id } = await this.jwtService.decode(confirmProjectDTO.token);
    if (!id) {
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
      { ...confirmProjectDTO, projectLead },
      { new: true },
    );

    return updatedData;
  }
}
