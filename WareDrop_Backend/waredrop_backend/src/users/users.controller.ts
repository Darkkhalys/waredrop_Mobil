import {Body, Controller, Post,} from "@nestjs/common";
import {Prisma} from "@prisma/client";
import {UserDto, UsersService} from "./users.service";
import {RolesService} from "../roles/roles.service";

export interface UpdateInput {
    data: {
        user_name?: string,
        user_password?: string,
        user_email?: string,
    }
    where: number;
}

@Controller('/user')
export class UsersController {
    constructor(private users: UsersService, private roles: RolesService) {}

    @Post('/role')
    async userRole(@Body() userId: UserDto) {
        return this.roles.getUserRoles(userId);
    }

    @Post('/update')
    async updateUser(@Body() updateInput: UpdateInput){
        return this.users.updateUser(updateInput);
    }

    @Post('/delete')
    async deleteUser(@Body() deleteUser: Prisma.usersWhereUniqueInput){
        return this.users.deleteUser(deleteUser);
    }
}