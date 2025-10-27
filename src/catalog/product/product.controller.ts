import {
  Body,
  Controller,
  Get,
  Request,
  Post,
  Query,
  ParseUUIDPipe,
  Param,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/identity/auth/auth.decorators';
import type { AuthenticatedRequestWithOrganization } from 'src/common/Request';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';
import {
  ProductCreatePayload,
  ProductDto,
  ProductUpdatePayload,
} from './product.dto';
import { CreateProductCommand } from './commands/create-product.command';
import { GetProductsQuery } from './queries/get-products.query';
import { PaginatedResultsI, PaginationDto } from 'src/common/pagination';
import { GetProductByIdQuery } from './queries/get-product-by-id.query';
import { UpdateProductCommand } from './commands/update-product.command';

@ApiTags('Catalog')
@Controller('organization/:organizationId/product')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async createProduct(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() payload: ProductCreatePayload,
  ) {
    return this.commandBus.execute(
      new CreateProductCommand(payload, req.organization.id),
    );
  }

  @Get()
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async findAll(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResultsI<ProductDto>> {
    return this.queryBus.execute(
      new GetProductsQuery(req.organization.id, paginationDto),
    );
  }

  @Get(':productId')
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async getProductById(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductDto> {
    return this.queryBus.execute(
      new GetProductByIdQuery(req.organization.id, productId),
    );
  }

  @Patch(':productId')
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async updateProduct(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() payload: ProductUpdatePayload,
  ): Promise<ProductDto> {
    return this.commandBus.execute(
      new UpdateProductCommand(productId, req.organization.id, payload),
    );
  }
}
