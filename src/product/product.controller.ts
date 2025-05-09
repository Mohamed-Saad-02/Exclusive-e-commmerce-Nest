import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { AuthCompose, User } from "src/common/decorators";
import { UserRole } from "src/common/types";
import { UploadFileOptions } from "src/common/utils";
import { CreateProductDto, UpdateProductDto } from "./DTO/product.dto";
import { ProductService } from "./product.service";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FilesInterceptor("images", 4, UploadFileOptions({})))
  async createProduct(
    @Body() body: CreateProductDto,
    @User("_id") userId: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productService.createProduct({
      userId,
      ...body,
      images,
    });
  }

  @Get()
  async getAllProducts(@Req() req: Request) {
    return this.productService.getAllProducts(req["parsedQuery"]);
  }

  @Get("/:productId")
  async getOneProduct(
    @Param("productId") productId: string,
    @Res() res: Response,
  ) {
    const result = await this.productService.getOneService(productId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete("/:productId")
  @AuthCompose([UserRole.ADMIN])
  async deleteOneProduct(
    @Param("productId") productId: string,
    @Res() res: Response,
    @User("_id") userId: string,
  ) {
    const result = await this.productService.deleteOneService(
      userId,
      productId,
    );
    return res.status(HttpStatus.OK).json(result);
  }

  @Put("/:productId")
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FilesInterceptor("images", 4, UploadFileOptions({})))
  async updateProduct(
    @Param("productId") productId: string,
    @User("_id") userId: string,
    @Body() body: UpdateProductDto,
    @Res() res: Response,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const result = await this.productService.updateProduct({
      productId,
      userId,
      ...body,
      images,
    });

    res.status(HttpStatus.OK).json(result);
  }
}
