import {
  DeleteResult,
  Document,
  FilterQuery,
  Model,
  PopulateOptions,
  SaveOptions,
  SortOrder,
  Types,
  UpdateQuery,
} from "mongoose";

interface IFindOneOptions<TDocument> {
  filters: FilterQuery<TDocument>;
  select?:
    | (keyof Omit<TDocument, keyof Document> | "_id")[]
    | [string]
    | string;
  populate?: PopulateOptions[];
  lean?: boolean;
}

interface IFindManyOptions<TDocument> extends IFindOneOptions<TDocument> {
  select?: string;

  //
  limit?: number;
  skip?: number;
  sort?: { [key: string]: SortOrder };
}

interface IUpdateOneOptions<TDocument> extends IFindOneOptions<TDocument> {
  data: UpdateQuery<TDocument>;
}

interface IDeleteOneOptions<TDocument> {
  filters: FilterQuery<TDocument>;
}

export abstract class BaseRepository<TDocument extends Document> {
  constructor(private readonly model: Model<TDocument>) {}

  async create(
    data: Partial<Omit<TDocument, keyof Document>>,
  ): Promise<TDocument> {
    return this.model.create(data);
  }

  async findOne({
    filters,
    select = "",
    populate = [],
    lean = false,
  }: IFindOneOptions<TDocument>): Promise<TDocument | null> {
    if (lean)
      return this.model
        .findOne(filters, select)
        .populate(populate)
        .lean() as Promise<TDocument | null>;
    return this.model.findOne(filters, select).populate(populate);
  }

  async find({
    filters,
    select = "",
    populate = [],
    lean = false,
    limit = 10,
    skip = 0,
    sort,
  }: IFindManyOptions<TDocument>): Promise<TDocument[]> {
    const query = this.model.find(filters);
    if (select) query.select(select);
    if (populate) query.populate(populate);

    if (limit || skip) query.limit(limit).skip(skip);
    if (sort) query.sort(sort);

    if (lean) return query.lean() as Promise<TDocument[]>;
    return query;
  }

  async updateOne({
    filters,
    data,
  }: IUpdateOneOptions<TDocument>): Promise<TDocument | null> {
    return this.model.findOneAndUpdate(filters, data, { new: true });
  }

  async deleteOne({
    filters,
  }: IDeleteOneOptions<TDocument>): Promise<TDocument | null> {
    return this.model.findOneAndDelete(filters);
  }

  async exists({
    filters,
  }: {
    filters: FilterQuery<TDocument>;
  }): Promise<{ _id: Types.ObjectId } | null> {
    return await this.model.exists(filters);
  }

  async deleteMany({
    filters,
  }: {
    filters: FilterQuery<TDocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteMany(filters);
  }

  async save(document: TDocument, options?: SaveOptions): Promise<TDocument> {
    return document.save(options);
  }
}
