# lablog-frontend

Frontend for `lablog`.
`lablog` is the software behind my blog https://zzi.io.

## Setup

1. Clone the repo.
2. Create subdirectories: `pages` and `posts` for standalone HTML files
3. Create subdirectory `public` for static resources, such as `favicon.ico`, `robots.txt`, `sitemap.txt`, etc.
4. Run `npm install`
5. Run `npm run dev` for dev server

## Build

0. Prior to building frontend static files, make sure `lablog-backend` server is up and running.

    Because during build process, buildtools will automatically register new posts at the backend, and modify post information at the backend if post has been modified.

    The buildtools also need to get the uuid assigned to each new post to track post changes later.

1. Use `lablog-buildtools` to update posts HTML files and `sitemap.txt` file.

    The build tools will also automatically do `npm run build` for you.

2. Run `npm run preview` to preview generated dist from local server.

## Deployment

Deployment of `lablog` requires both a static file server (frontend server) and a server capable of running python code(backend API server).

However, If only file server is available (for example deploying to Vercel or Cloudfare Pages), we can still deploy the frontend-only version. 
In that case the homepage and posts will work, but commenting will not work (users cannot view or post comments).

To deploy the frontend, either directly copy files under `dist` directly to the file server, or use `lablog-buildtools` to deploy.
