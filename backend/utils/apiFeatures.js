class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryStr = queryString;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // search() {
  //   if (this.queryStr.search) {
  //     const keyword = this.queryStr.search.trim();

  //     this.query = this.query.find({
  //       name: {
  //         $regex: keyword,
  //         $options: "i",
  //       },
  //     });
  //   }

  //   return this;
  // }
  search() {
    if (this.queryStr.search) {
      const keyword = this.queryStr.search.trim();
      const words = keyword.split(/\s+/);
      const regexQueries = words.map((word) => ({
        name: {
          $regex: word,
          $options: "i",
        },
      }));

      this.query = this.query.find({
        $and: regexQueries,
      });
    }

    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt _id");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields
        .split(",")
        .filter((field) => field.trim().toLowerCase() !== "password")
        .join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    this.page = this.queryStr.page * 1 || 1;
    this.limit = this.queryStr.limit * 1 || 10;

    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);

    return this;
  }
}

export default APIFeatures;
