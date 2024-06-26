import { Injectable } from '@nestjs/common';
import {PrismaService} from "../database/prisma.service";
import {Prisma} from "@prisma/client";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {IsStringArray} from "../validation/IsStringArrayConstraint";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class AddRoleInput {
    @ApiProperty({
        description: 'The id of the role which will be assigned to a user'
    })
    @IsNumber()
    @IsNotEmpty()
    roleId: number

    @ApiProperty({
        description: 'The id of the user which the role will be assigned to'
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number
}

export class Role {
    @ApiPropertyOptional({
        description: 'The id of a role'
    })
    @IsNumber()
    @IsOptional()
    roleId?: number

    @ApiProperty({
        description: 'The name of a role'
    })
    @IsString()
    @IsNotEmpty()
    roleName: string

    @ApiPropertyOptional({
        description: 'The permissions of a role',
        type: 'string[]'
    })
    @IsStringArray()
    @IsOptional()
    permissions?: string[]
}

export class RoleDto {
    @ApiProperty({
        description: 'The id of a role'
    })
    @IsNumber()
    @IsNotEmpty()
    roleId: number
}

export class GetRoleDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number
}

@Injectable()
export class RolesService {
    constructor(private readonly db: PrismaService) {}

    async createRole(newRole: Role){
        return this.db.roles.create({
            data: {
                role_name: newRole.roleName,
            }
        })
    }

    async getUserRoles(userId: GetRoleDto) {
        const roles = await this.db.user_has_role.findMany({
            select: {
                roles: {
                    select: {
                        role_name: true
                    }
                }
            },
            where: {
                user_user_id: userId.userId
            }
        })
        const rolesResult: string[] = roles.map((roles) => roles.roles.role_name)
        return rolesResult;
    }

    async addRoleToUser(addRoleInput: AddRoleInput){
        return this.db.user_has_role.create({
            data: {
                user_user_id: addRoleInput.userId,
                role_role_id: addRoleInput.roleId
            }
        })
    }

    async listRoles(){
        const roleList: Role[] = [];
        const roles = await this.db.roles.findMany({
            select: {
                role_id: true,
                role_name: true,
                role_has_permission: {
                    select: {
                        permission_permission_id: true,
                    }
                }
            }
        })
        const permissions = await this.db.permissions.findMany({
            select: {
                permission_name: true,
                permission_id: true,
            }
        })
        for (const role of roles) {
            const roleItem: Role = {roleId: role.role_id,roleName: role.role_name, permissions: []}
            for (const permission of permissions) {
                if(role.role_has_permission[0] === undefined){
                    break;
                }
                else if (role.role_has_permission[0].permission_permission_id === permission.permission_id){
                    roleItem.permissions.push(permission.permission_name);
                }
            }
            roleList.push(roleItem);
        }
        return roleList;
    }

    async removeRole(removeInput: AddRoleInput){
        return this.db.user_has_role.delete({
            where: {
                role_role_id_user_user_id: {
                    role_role_id: removeInput.roleId,
                    user_user_id: removeInput.userId,
                }
            }
        })
    }

    async deleteRole(deleteRole: RoleDto){
        try {

            //If the role got any assigned permissions, the relation will be deleted as well
            const hasPermission = await this.db.role_has_permission.findFirst({
                where: {
                    role_role_id: deleteRole.roleId,
                }
            })

            if (hasPermission){
                await this.db.role_has_permission.deleteMany({
                    where: {
                        role_role_id: deleteRole.roleId,
                    }
                })
            }

            //If the role is assigned to any user, the relation will be deleted as well
            const assigned = await this.db.user_has_role.findFirst({
                where: {
                    role_role_id: deleteRole.roleId,
                }
            })

            if (assigned){
                await this.db.user_has_role.deleteMany({
                    where: {
                        role_role_id: deleteRole.roleId,
                    }
                })
            }

            await this.db.roles.delete({
                where: {
                    role_id: deleteRole.roleId,
                }
            });

            return {Massage: "Role deleted"};
        }
        catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'){
                return {errorMassage: "Role does not exist"};
            }
            else {
                throw e
            }
        }
    }
}
