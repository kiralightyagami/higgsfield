import "dotenv/config";
import express from "express";
import { prisma } from "./db";
import { authMiddleware, signToken, type AuthRequest } from "./auth";
import { CreateAvatarSchema, CreateUserSchema } from "./types";
import { createImage } from "./image";
import { uuid } from 'uuidv4';import { generateVideo } from "./video";
;


const app = express();

app.use(express.json())

app.post("/api/v1/signup", async (req, res) => {
    const { success, data } = CreateUserSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({
            message: "invalid credentials"
        })
        return;
    }

    const user = await prisma.user.create({
        data: {
            username: data.username,
            password: data.password
        }
    })

    res.json({
        token: signToken(user.id),
        id: user.id,
        username: user.username
    });
})

app.post("/api/v1/signin", async (req, res) => {
    const { success, data } = CreateUserSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({
            message: "invalid credentials"
        })
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            username: data.username
        }
    });

    if (!user || user.password !== data.password) {
        res.status(401).json({
            message: "invalid username or password"
        });
        return;
    }

    res.json({
        token: signToken(user.id),
        id: user.id,
        username: user.username
    });
})

app.post("/api/v1/avatar", authMiddleware, async (req, res) => {
    const { data , success } =  CreateAvatarSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({
            message: "incorrect"
        })
        return;
    }

    const leftProfileId = uuid();
    const rightProfileId = uuid();
    const frontProfileId = uuid();

    await Promise.all([
        createImage("Create a side profile for user for the left side. It should be a high quality portfolio shoot type photo", data.image ,`./assets/${leftProfileId}`),
        createImage("Create a side profile for user for the right side. It should be a high quality portfolio shoot type photo", data.image ,`./assets/${rightProfileId}`),
        createImage("Create a side profile for user for the front side. It should be a high quality portfolio shoot type photo", data.image ,`./assets/${frontProfileId}`)
    ]);

    // put in s3

    // await prisma.avatar.create({
    //     data: {
    //       userId: "1",
    //       name: req.body.name
    //     }
    //   })

    
    res.json({});
})

app.post("/api/v1/video", authMiddleware, async (req, res) => {
    await generateVideo("The video opens with a medium, eye-level shot of a beautiful man with dark hair and warm brown eyes. She wears a magnificent, high-fashion flamingo dress with layers of pink and fuchsia feathers, complemented by whimsical pink, heart-shaped sunglasses. She walks with serene confidence through the crystal-clear, shallow turquoise water of a sun-drenched lagoon. The camera slowly pulls back to a medium-wide shot, revealing the breathtaking scene as the dress's long train glides and floats gracefully on the water's surface behind her. The cinematic, dreamlike atmosphere is enhanced by the vibrant colors of the dress against the serene, minimalist landscape, capturing a moment of pure elegance and high-fashion fantasy.", 
        ["image url",
          "image url",
          "image url"
        ], "./output/video.mp4")
      res.json({});
})

app.get("/api/v1/video/:videoId", authMiddleware, (req, res) => {
    res.json({});
})

app.get("/api/v1/videos", authMiddleware, (req, res) => {
    res.json({});
})

app.get("/api/v1/me", authMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, username: true }
    });

    if (!user) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    res.json(user);
})

app.get("/api/v1/models", (req, res) => {
    res.json({});
})

app.get("/api/v1/avatar/:avatarId", authMiddleware, async (req, res) => {
    const avatars = await prisma.avatar.findMany({
        where: {
          userId: "1",
        }
      })
      console.log(avatars);
      res.json({avatars});
})

app.get("/api/v1/avatars", authMiddleware, async (req, res) => {
    const avatars = await prisma.avatar.findMany({
        where: {
          userId: "1",
        }
      })
      res.json({avatars});
})

app.listen(3000);
