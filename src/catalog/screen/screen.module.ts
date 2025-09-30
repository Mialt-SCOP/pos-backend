import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenController } from './screen.controller';
import { ProductOnScreen, Screen } from './screen.entity';
import { ScreenService } from './screen.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Screen, ProductOnScreen]), ProductModule],
  controllers: [ScreenController],
  providers: [ScreenService],
  exports: [],
})
export class ScreenModule {}
