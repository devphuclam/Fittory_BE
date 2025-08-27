import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BlogModuleService } from "../modules/blog/service"
import { BLOG_MODULE } from "../modules/blog"
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

type Input = {
  title: string
}

const createPostStep = createStep(
  "create-post", 
  async (input: Input, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(
      BLOG_MODULE
    )

    const post = await blogModuleService.createPosts({title: input.title})
    
    return new StepResponse(post, post.id)
  },
  async (postId, { container }) => {
    if (!postId) {
      return
    }

    const blogModuleService: BlogModuleService = container.resolve(
      BLOG_MODULE
    )

    await blogModuleService.deletePosts(postId)
  }
)

export const createPostWorkflow = createWorkflow(
  "create-post",
  (input: Input) => {
    const post = createPostStep(input)

    return new WorkflowResponse(post)
  }
)