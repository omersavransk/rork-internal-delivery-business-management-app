import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import registerRoute from "./routes/auth/register/route";
import loginRoute from "./routes/auth/login/route";
import meRoute from "./routes/auth/me/route";
import createOrgRoute from "./routes/organizations/create/route";
import addUserRoute from "./routes/organizations/add-user/route";
import listUsersRoute from "./routes/organizations/list-users/route";
import listIncomeRoute from "./routes/income/list/route";
import createIncomeRoute from "./routes/income/create/route";
import updateIncomeRoute from "./routes/income/update/route";
import deleteIncomeRoute from "./routes/income/delete/route";
import listExpensesRoute from "./routes/expenses/list/route";
import createExpenseRoute from "./routes/expenses/create/route";
import updateExpenseRoute from "./routes/expenses/update/route";
import deleteExpenseRoute from "./routes/expenses/delete/route";
import listCouriersRoute from "./routes/couriers/list/route";
import createCourierRoute from "./routes/couriers/create/route";
import updateCourierRoute from "./routes/couriers/update/route";
import deleteCourierRoute from "./routes/couriers/delete/route";
import listDeliveriesRoute from "./routes/deliveries/list/route";
import createDeliveryRoute from "./routes/deliveries/create/route";
import listPaymentsRoute from "./routes/payments/list/route";
import createPaymentRoute from "./routes/payments/create/route";
import listActivitiesRoute from "./routes/activities/list/route";

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
  income: createTRPCRouter({
    list: listIncomeRoute,
    create: createIncomeRoute,
    update: updateIncomeRoute,
    delete: deleteIncomeRoute,
  }),
  expenses: createTRPCRouter({
    list: listExpensesRoute,
    create: createExpenseRoute,
    update: updateExpenseRoute,
    delete: deleteExpenseRoute,
  }),
  couriers: createTRPCRouter({
    list: listCouriersRoute,
    create: createCourierRoute,
    update: updateCourierRoute,
    delete: deleteCourierRoute,
  }),
  deliveries: createTRPCRouter({
    list: listDeliveriesRoute,
    create: createDeliveryRoute,
  }),
  payments: createTRPCRouter({
    list: listPaymentsRoute,
    create: createPaymentRoute,
  }),
  activities: createTRPCRouter({
    list: listActivitiesRoute,
  }),
});

export type AppRouter = typeof appRouter;
