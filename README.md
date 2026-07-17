# WhackACrylie

Original browser-based office ragdoll parody game using custom artwork.

## Run locally

Requires Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

Health endpoint:

```text
http://localhost:3000/health
```

## Deploy from GitHub to Railway

1. Create a new GitHub repository.
2. Upload the **contents of this folder** to the repository root.
3. In Railway, select **New Project → Deploy from GitHub repo**.
4. Select the repository.
5. Railway reads `railway.json`, runs `npm start`, and checks `/health`.
6. Under **Settings → Networking**, generate a public domain.

Do not rename `package.json`, `server.js`, `railway.json`, or the `public` folder.

## Correct repository structure

```text
public/
  index.html
.gitignore
package.json
railway.json
server.js
README.md
```

No Dockerfile is required. There are no npm dependencies.
