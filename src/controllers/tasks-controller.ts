import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import TasksModel from '@models/tasks-model';
import UserModel from '@models/user-model';

export default {
  async getTaskById(req: Request, res: Response, next: NextFunction) {},
  async getTaskList(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const userId = user?.id;
    const { isAdmin } = req.query;

    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      let userTask;

      if (isAdmin === 'true') {
        userTask = await TasksModel.findOne({ userId: user?.id });
      } else {
        userTask = await TasksModel.aggregate([
          {
            $match: {
              'tasks.assignTo': new mongoose.Types.ObjectId(userId),
            },
          },

          // return only matched tasks
          {
            $addFields: {
              tasks: {
                $filter: {
                  input: '$tasks',
                  as: 't',
                  cond: { $eq: ['$$t.assignTo', new mongoose.Types.ObjectId(userId)] },
                },
              },
            },
          },

          // lookup assignBy user
          {
            $lookup: {
              from: 'users',
              let: { uid: '$userId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$uid'] } } },
                { $project: { _id: 1, fullName: 1 } },
              ],
              as: 'assignBy',
            },
          },

          // convert assignBy array → object
          { $unwind: '$assignBy' },

          // merge assignBy into each task
          {
            $addFields: {
              tasks: {
                $map: {
                  input: '$tasks',
                  as: 't',
                  in: {
                    $mergeObjects: [
                      '$$t',
                      { assignBy: '$assignBy' }, // 👈 inject assignBy into each task
                    ],
                  },
                },
              },
            },
          },

          // return tasks as a flat array
          {
            $project: {
              _id: 0,
              tasks: 1,
            },
          },

          { $unwind: '$tasks' }, // flatten
          { $replaceWith: '$tasks' }, // return each task as root object
        ]);
      }

      const tasks = (userTask?.tasks ?? userTask ?? []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const paginated = tasks.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        data: paginated,
        page,
        limit,
        total: tasks.length,
        totalPages: Math.ceil(tasks.length / limit),
        hasMore: skip + limit < tasks.length,
      });
    } catch (error) {
      next(error);
      return res.status(400).json({ success: false });
    }
  },
  async createTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { title, description, status, priority, assignTo = null } = req.body;
    const { adminUser } = req.query;

    try {
      let createUserId = user?.id;
      if (adminUser) {
        const adminUser = await TasksModel.findOne(
          { 'tasks.assignTo': createUserId },
          { userId: 1, _id: 0 },
        );
        if (adminUser) {
          createUserId = adminUser.userId;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Admin user not found',
          });
        }
      }

      const taskData = {
        title,
        description,
        status,
        priority,
        assignTo: assignTo || req.user?.id,
      };

      await TasksModel.findOneAndUpdate(
        { userId: createUserId },
        { $push: { tasks: taskData } },
        { new: true, upsert: true },
      );
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: true,
        message: 'Task create failed',
      });
    }
  },
  async updateTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { taskId, adminId } = req.query;
    const { title, description, status, priority, assignTo = null } = req.body;

    const updateTaskUserId = adminId ? adminId : user?.id;

    try {
      const userTask = await TasksModel.findOne(
        { userId: updateTaskUserId, 'tasks._id': taskId },
        { 'tasks.$': 1 },
      );

      if (!userTask) {
        return res.status(400).json({
          success: false,
          message: `Task not found by ID: ${taskId}`,
        });
      }

      const taskData = { title, description, status, priority, assignTo };

      const updateFields: Record<string, any> = {};
      for (const [key, value] of Object.entries(taskData)) {
        updateFields[`tasks.$.${key}`] = value;
      }
      await TasksModel.findOneAndUpdate(
        { userId: updateTaskUserId, 'tasks._id': taskId },
        { $set: updateFields },
        { new: true },
      );
      return res.status(201).json({
        success: true,
        message: 'Task updated successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: true,
        message: `Task ${taskId} update failed`,
      });
    }
  },
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { taskId } = req.query;
    try {
      const adminUser = await UserModel.findById(user?.id);

      if (!adminUser) {
        return res.status(400).json({
          success: false,
          message: 'Not found',
        });
      }
      if (adminUser && adminUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: `Task ID: ${taskId} can be deleted only by an admin.`,
        });
      }
      await TasksModel.findOneAndUpdate(
        { userId: user?.id },
        {
          $pull: { tasks: { _id: taskId } },
        },
      );
      return res.status(200).json({
        success: true,
        message: `Task ${taskId} deleted successfully`,
      });
    } catch (error) {
      next(error);
      return res.status(400).json({
        success: true,
        message: `Task ${taskId} delete failed`,
      });
    }
  },
};
