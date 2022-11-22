import {Request, Response} from "express";
import User from '../models/User';

export const loginController = async (req: Request, res: Response) => {
  try {
    const {username} = req.body;
    console.log(username)

    let user = await User.findOne({username})

    if (!user) {
      user = new User({
        username,
        status: 'online',
        messages: [],
      })

      await user.save();

      return res
        .status(201)
        .json({user})
    }

    if (user!.status === 'online') {
      return res
        .status(401)
        .json(`Ops! Looks like ${username} is already online`)
    }

    res
      .status(200)
      .json({user})

  } catch (e) {
    res
      .status(500)
      .json({error: e})
  }
}