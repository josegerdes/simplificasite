import { Db } from "mongodb";

import { collections } from "@/server/db/collections";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function startOfMonth(): Date {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

export async function getDashboardStats(db: Db) {
  const enrollments = collections.enrollments(db);

  const [today, week, month, totalApproved, totalAll, revenueAgg, bySellerAgg, byCourseAgg] = await Promise.all([
    enrollments.countDocuments({ paymentStatus: "approved", createdAt: { $gte: startOfToday() } }),
    enrollments.countDocuments({ paymentStatus: "approved", createdAt: { $gte: startOfWeek() } }),
    enrollments.countDocuments({ paymentStatus: "approved", createdAt: { $gte: startOfMonth() } }),
    enrollments.countDocuments({ paymentStatus: "approved" }),
    enrollments.countDocuments({}),
    enrollments
      .aggregate([{ $match: { paymentStatus: "approved" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
      .toArray(),
    enrollments
      .aggregate([
        { $match: { paymentStatus: "approved", sellerId: { $ne: null } } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "sellers", localField: "_id", foreignField: "_id", as: "seller" } },
        { $unwind: "$seller" },
        { $project: { _id: 0, name: "$seller.name", count: 1 } },
      ])
      .toArray(),
    enrollments
      .aggregate([
        { $match: { paymentStatus: "approved" } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
        { $unwind: "$course" },
        { $project: { _id: 0, name: "$course.name", count: 1 } },
      ])
      .toArray(),
  ]);

  const revenue = (revenueAgg[0]?.total as number | undefined) ?? 0;
  const conversionRate = totalAll > 0 ? Math.round((totalApproved / totalAll) * 100) : 0;

  return {
    enrollmentsToday: today,
    enrollmentsWeek: week,
    enrollmentsMonth: month,
    totalApproved,
    totalAll,
    revenue,
    conversionRate,
    sellerRanking: bySellerAgg as { name: string; count: number }[],
    topCourses: byCourseAgg as { name: string; count: number }[],
  };
}
