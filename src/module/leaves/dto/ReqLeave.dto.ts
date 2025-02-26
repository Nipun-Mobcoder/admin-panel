import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, ValidateNested } from "class-validator";
import { leaveType } from "src/common/enum/leaveType.enum";

export class ReqLeaveDTO {
    @IsEnum(leaveType)
    leaveType: leaveType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Date)
    @IsDate({ each: true })
    days: Date[];
}