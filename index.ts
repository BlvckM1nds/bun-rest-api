import { serve } from "bun";

interface Post {
  id: string;
  title: string;
  content: string;
};

const PORT: number = 3000;

// ----------------------------------------------------------------
let blogPosts: Post[] = [];

function getAllPosts(): Response {
  return new Response(JSON.stringify({
    data: blogPosts,
    message: "Posts fetched successfully",
    success: true,
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

function getPostById(id: string): Response {
  const post = blogPosts.find((post) => post.id === id);

  if (!post) {
    return new Response(JSON.stringify({
      message: "Post not found",
      success: false,
    }), { status: 404 });
  };

  return new Response(JSON.stringify({
    data: post,
    success: true,
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

function createPost(title: string, content: string): Response {
  const newPost: Post = {
    id: crypto.randomUUID(),
    title,
    content,
  };

  blogPosts.push(newPost);

  return new Response(JSON.stringify({
    data: newPost,
    message: "Post created successfully",
    success: true,
  }), {
    headers: { "Content-Type": "application/json" },
    status: 201,
  });
};

function updatePost(id: string, title: string, content: string): Response {
  const postIndex = blogPosts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return new Response(JSON.stringify({
      message: "Post not found",
      success: false,
    }), { status: 404 });
  };

  blogPosts[postIndex] = {
    ...blogPosts[postIndex],
    title,
    content,
  };

  return new Response(JSON.stringify({
    message: "Post updated successfully",
    success: true,
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

function deletePost(id: string): Response {
  const postIndex = blogPosts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return new Response(JSON.stringify({
      message: "Post not found",
      success: false,
    }), { status: 404 });
  };

  blogPosts.splice(postIndex, 1);

  return new Response(JSON.stringify({
    message: "Post deleted successfully",
    success: true,
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

serve({
  port: PORT,
  async fetch(req) {
    const { method } = req;
    const { pathname, searchParams } = new URL(req.url);

    if (method === "GET" && pathname === "/api/posts") {
      const id = searchParams.get("id");

      if (id) {
        return getPostById(id);
      };

      return getAllPosts();
    };

    if (method === "POST" && pathname === "/api/posts") {
      const { title, content } = await req.json();
      return createPost(title, content);
    };

    if (method === "PUT" && pathname === "/api/posts") {
      const { id } = await req.json();

      if (id) {
        const { title, content } = await req.json();
        return updatePost(id, title, content);
      };
    };

    if (method === "DELETE" && pathname === "/api/posts") {
      const { id } = await req.json();

      if (id) {
        return deletePost(id);
      };
    };

    return new Response(JSON.stringify({
      message: "Not found",
      success: false,
    }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  },
});

console.log(`Server is running on port ${PORT}`);
