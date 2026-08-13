# Azure DevOps deployment

Everything here targets **Azure DevOps**. The manual content and the build engine
are shared and live at the repo root (`/docs`, `/build`, `/site`).

## 1. Publish the wiki

Publish the Markdown as a **code wiki** (one-time):

1. **Overview → Wiki → Publish code as wiki**.
2. Repository: this repo · Branch: `main` · Folder: **`/docs`** · Name: *9A Smart Connect*.

The wiki tree follows the folders and the `.order` files; images resolve from
`docs/.attachments`.

## 2. Create the pipeline

1. **Pipelines → New pipeline → Azure Repos Git →** this repo.
2. **Existing Azure Pipelines YAML file** → path **`/devops/azure-pipelines.yml`**.
3. Run it.

What it does on every change to `/docs` or `/build` (it **excludes** `/site` so the
automated commit doesn't loop):

1. installs Node + `markdown-it`,
2. runs `node build/build.mjs`,
3. commits the refreshed `/site` back with `[skip ci]`, and
4. publishes `/site` as a pipeline artifact.

## 3. Allow the build identity to push (one-time)

Project Settings → Repositories → this repo → **Security** → grant
**«Project» Build Service** the **Contribute** permission (and **Bypass policies
when pushing** if `main` is protected).

> The pipeline commits the generated HTML back to Git, exactly as requested. If you
> would rather keep `/site` out of Git and use the artifact only, delete the
> *"Commit regenerated site back to Git"* step from
> [azure-pipelines.yml](azure-pipelines.yml).
