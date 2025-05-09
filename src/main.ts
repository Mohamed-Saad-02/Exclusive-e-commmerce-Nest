import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { RequestQueryParse } from "./common/middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(RequestQueryParse);

  // Validation pipe to validate the request body and throw an error if the request body is invalid
  // Work Globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
