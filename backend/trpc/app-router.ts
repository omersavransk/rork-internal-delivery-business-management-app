import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import registerRoute from "./routes/auth/register/route";
import loginRoute from "./routes/auth/login/route";
import meRoute from "./routes/auth/me/route";
import createOrgRoute from "./routes/organizations/create/route";
import addUserRoute from "./routes/organizations/add-user/route";
import listUsersRoute from "./routes/organizations/list-users/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerRoute,
    login: loginRoute,
    me: meRoute,
  }),
  organizations: createTRPCRouter({
    create: createOrgRoute,
    addUser: addUserRoute,
    listUsers: listUsersRoute,
  }),
});

export type AppRouter = typeof appRouter;
