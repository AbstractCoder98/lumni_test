import { resolveClass } from "@container";
import type IAuthorizationDataDto from "@application/models/IAuthorizationDataDto";
import { BadRequestException, Catch, createHandler, Get, Query } from "@storyofams/next-api-decorators";
import { AuthInfo, JwtAuthGuard } from "../nextApiMiddlewares/JwtAuth";
import { logExceptions, LogRequests } from "@presentation/nextApiMiddlewares/AppInsights";
import AdminGetPersonData from "@application/AdminGetPersonData";


@Catch(logExceptions)
class AdminPersonKeyController {
  private readonly searchServices = resolveClass(AdminGetPersonData);

  @LogRequests()
  @Get()
  @JwtAuthGuard()
  async search(
    @Query("employmentInfoKeyWords") searchString: string,
    @AuthInfo() authInfo?: IAuthorizationDataDto) {
    const result = await this.searchServices.getPersonsByEmploymentInfoKeyWords(searchString, authInfo);
    return result;
  }
}

export default createHandler(AdminPersonKeyController);
