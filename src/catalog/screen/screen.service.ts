import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Organization } from 'src/identity/organization/organization.entity';
import { ProductOnScreen, Screen } from './screen.entity';
import {
  AddProductToScreenPayload,
  ScreenCreatePayload,
  ScreenDto,
  ScreenUpdatePayload,
} from './screen.dto';
import {
  getDefaultRank,
  getRankAfter,
  getRankBefore,
  getRankBetween,
} from 'src/common/stringRank';
import { GetProductByIdHandler } from '../product/queries/handlers/get-product-by-id.handler';

@Injectable()
export class ScreenService {
  constructor(
    @InjectRepository(Screen)
    private readonly screenRepository: Repository<Screen>,
    @InjectRepository(ProductOnScreen)
    private readonly productOnScreenRepository: Repository<ProductOnScreen>,
    private readonly productService: GetProductByIdHandler,
  ) {}

  async findAll(organization: Organization): Promise<ScreenDto[]> {
    const screens = await this.screenRepository.manager
      .createQueryBuilder(Screen, 's')
      .select()
      .leftJoinAndSelect('s.productOnScreens', 'pos')
      .leftJoinAndSelect('pos.product', 'p')
      .leftJoinAndSelect('p.accountingGroup', 'a')
      .where(`s."organizationId" = :organizationId`, {
        organizationId: organization.id,
      })
      .orderBy(`s.rank`, 'ASC')
      .getMany();
    return screens.map((screen) => screen.toDto());
  }

  async getOneById(
    organization: Organization,
    screenId: string,
  ): Promise<ScreenDto> {
    const screen = await this.screenRepository.findOne({
      where: { id: screenId, organizationId: organization.id },
    });
    if (!screen) throw new NotFoundException();
    return screen.toDto();
  }

  async create(
    organization: Organization,
    payload: ScreenCreatePayload,
  ): Promise<ScreenDto> {
    const lastScreen = await this.screenRepository.findOne({
      where: { organizationId: organization.id },
      order: { rank: 'DESC' },
    });
    const screen = new Screen();
    screen.name = payload.name;
    screen.rank = lastScreen ? getRankAfter(lastScreen.rank) : getDefaultRank();
    screen.organizationId = organization.id;
    if (payload.color) {
      screen.color = payload.color;
    }
    const createdScreen = await this.screenRepository.save(screen);
    return createdScreen.toDto();
  }

  async update(
    organization: Organization,
    screenId: string,
    payload: ScreenUpdatePayload,
  ): Promise<ScreenDto> {
    const screen = await this.screenRepository.findOne({
      where: { id: screenId, organizationId: organization.id },
    });
    if (!screen) throw new NotFoundException();

    if (payload.name) {
      screen.name = payload.name;
    }
    if (typeof payload.color !== 'undefined') {
      screen.color = payload.color;
    }
    if (payload.setAfter) {
      const beforeScreen = await this.screenRepository.findOne({
        where: { id: payload.setAfter, organizationId: organization.id },
      });
      if (!beforeScreen)
        throw new BadRequestException(`After screen not found`);

      const afterScreen = await this.screenRepository.findOne({
        where: {
          organizationId: organization.id,
          rank: MoreThan(beforeScreen.rank),
        },
        order: { rank: 'ASC' },
      });
      if (afterScreen) {
        screen.rank = getRankBetween(beforeScreen.rank, afterScreen.rank);
      } else {
        screen.rank = getRankAfter(beforeScreen.rank);
      }
    }
    if (payload.setBefore) {
      const afterScreen = await this.screenRepository.findOne({
        where: { id: payload.setBefore, organizationId: organization.id },
      });
      if (!afterScreen)
        throw new BadRequestException(`Before screen not found`);

      const beforeScreen = await this.screenRepository.findOne({
        where: {
          organizationId: organization.id,
          rank: LessThan(afterScreen.rank),
        },
        order: { rank: 'DESC' },
      });
      if (beforeScreen) {
        screen.rank = getRankBetween(beforeScreen.rank, afterScreen.rank);
      } else {
        screen.rank = getRankBefore(afterScreen.rank);
      }
    }

    const savedScreen = await this.screenRepository.save(screen);
    return savedScreen.toDto();
  }

  async addProductOnScreen(
    organization: Organization,
    screenId: string,
    payload: AddProductToScreenPayload,
  ) {
    const screen = await this.screenRepository.findOne({
      where: { id: screenId, organizationId: organization.id },
    });
    if (!screen) throw new NotFoundException();

    const product = await this.productService.execute({
      productId: payload.productId,
      organizationId: organization.id,
    });

    const lastProductOnScreen = await this.productOnScreenRepository.findOne({
      where: { screenId: screen.id },
      order: { rank: 'DESC' },
    });

    const productOnScreen = new ProductOnScreen();
    productOnScreen.active = payload.active;
    productOnScreen.productId = product.id;
    productOnScreen.setProductDto(product);
    productOnScreen.screenId = screen.id;
    productOnScreen.rank = lastProductOnScreen
      ? getRankAfter(lastProductOnScreen.rank)
      : getDefaultRank();
    const savedProductOnScreen =
      await this.productOnScreenRepository.manager.save(productOnScreen);

    return savedProductOnScreen.toDto();
  }
}
