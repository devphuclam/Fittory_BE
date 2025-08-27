import { model } from "@medusajs/framework/utils"

export const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
})