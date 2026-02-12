import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

/**
 * ADMIN API ROUTE
 *
 * Provides administrative access to view all users and their wallet data.
 * In production, this should be protected with authentication/authorization.
 */

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Get all users with their wallet data
    if (action === "users" || !action) {
      const users = await User.find({})
        .select("-passwordHash") // Exclude password hash
        .sort({ createdAt: -1 })
        .lean();

      // Fetch wallet data for each user
      const usersWithWallets = await Promise.all(
        users.map(async (user) => {
          try {
            const wallet = await Wallet.findOne({
              userId: user._id.toString(),
            }).lean();

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              avatarUrl: user.avatarUrl,
              createdAt: user.createdAt,
              wallet: wallet
                ? {
                    balanceUsd: wallet.balanceUsd,
                    positionsCount: wallet.positions
                      ? wallet.positions instanceof Map
                        ? wallet.positions.size
                        : Object.keys(wallet.positions).length
                      : 0,
                    tradesCount: wallet.trades?.length || 0,
                    totalTrades: wallet.trades || [],
                    positions: wallet.positions
                      ? wallet.positions instanceof Map
                        ? Object.fromEntries(wallet.positions)
                        : wallet.positions
                      : {},
                  }
                : null,
            };
          } catch (walletError) {
            console.error(
              `Error fetching wallet for user ${user._id}:`,
              walletError,
            );
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              avatarUrl: user.avatarUrl,
              createdAt: user.createdAt,
              wallet: null,
            };
          }
        }),
      );

      return NextResponse.json({
        success: true,
        count: usersWithWallets.length,
        users: usersWithWallets,
      });
    }

    // Get statistics
    if (action === "stats") {
      const totalUsers = await User.countDocuments();
      const totalWallets = await Wallet.countDocuments();

      const wallets = await Wallet.find({}).lean();
      const totalBalance = wallets.reduce(
        (sum, w) => sum + (w.balanceUsd || 0),
        0,
      );
      const totalTrades = wallets.reduce(
        (sum, w) => sum + (w.trades?.length || 0),
        0,
      );

      return NextResponse.json({
        success: true,
        stats: {
          totalUsers,
          totalWallets,
          totalBalance: totalBalance.toFixed(2),
          totalTrades,
          avgBalancePerUser:
            totalUsers > 0 ? (totalBalance / totalUsers).toFixed(2) : 0,
          avgTradesPerUser:
            totalUsers > 0 ? (totalTrades / totalUsers).toFixed(2) : 0,
        },
      });
    }

    // Get specific user details
    const userId = searchParams.get("userId");
    if (userId) {
      const user = await User.findById(userId).select("-passwordHash").lean();
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const wallet = await Wallet.findOne({ userId: userId }).lean();

      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          wallet: wallet
            ? {
                balanceUsd: wallet.balanceUsd,
                positions: wallet.positions
                  ? Object.fromEntries(wallet.positions)
                  : {},
                trades: wallet.trades || [],
              }
            : null,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Admin API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch admin data",
        details: errorMessage,
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 },
    );
  }
}

// DELETE user and their wallet
export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Delete user and their wallet
    await User.findByIdAndDelete(userId);
    await Wallet.findOneAndDelete({ userId });

    return NextResponse.json({
      success: true,
      message: "User and wallet deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
