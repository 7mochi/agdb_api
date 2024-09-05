import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Adrenaline Gamer Database')
    .setDescription(
      'Database for player data and bans in Adrenaline Gamer, continuing the SLAG legacy',
    )
    .setVersion('1.0')
    .setExternalDoc('Postman collection', '/api-json')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const theme = new SwaggerTheme();
  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.GRUVBOX),
  };

  SwaggerModule.setup('api', app, document, options);

  const configService = app.get(ConfigService);
  const port = configService.get('API_PORT') ?? 3000;

  await app.listen(port);
}
bootstrap();
