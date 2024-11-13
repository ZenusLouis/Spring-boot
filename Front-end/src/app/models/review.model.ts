export interface Review {
  reviewId?: number;
  content: string;
  rating: number;
  createdAt?: Date;
  productId: number;
  userId: number;
  replies?: Reply[];
  reactions?: ReactionCount[];
  likeCount?: number;
  loveCount?: number;
  hahaCount?: number;
  wowCount?: number;
  sadCount?: number;
  angryCount?: number;
}

export interface Reply {
  replyId?: number;
  content: string;
  createdAt?: Date;
  userId: number;
  username: string;
  reviewId: number;
  reactions?: ReactionCount[];
  likeCount?: number;
  loveCount?: number;
  hahaCount?: number;
  wowCount?: number;
  sadCount?: number;
  angryCount?: number;
}

export interface Reaction {
  reactionId?: number;
  userId: number;
  reviewId?: number;
  replyId?: number;
  reactionType: string;
  count?: number;
}

export interface ReactionCount {
  reactionType: string;
  count: number;
}
