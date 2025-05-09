import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BrandModule } from "./brand/brand.module";
import { CartModule } from "./cart/cart.module";
import { CategoryModule } from "./category/category.module";
import { GlobalModule } from "./global.module";
import { ProductModule } from "./product/product.module";
import { SubCategoryModule } from "./subCategory/subCategory.module";
import { UserModule } from "./user/user.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { BannerModule } from "./banner/banner.module";

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({ isGlobal: true }),
    // Database
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    // Modules
    AuthModule,
    CategoryModule,
    ProductModule,
    CartModule,
    UserModule,
    SubCategoryModule,
    BrandModule,
    WishlistModule,
    BannerModule,

    // Global
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
