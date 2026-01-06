// Database Types for Food Rating App

export type UserRole = 'super_admin' | 'admin'
export type SessionStatus = 'open' | 'closed'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    created_at: string
}

export interface Group {
    id: string
    name: string
    created_at: string
}

export interface UserGroup {
    user_id: string
    group_id: string
}

export interface Category {
    id: string
    name: string
    order: number
    active: boolean
    created_at: string
}

export interface Restaurant {
    id: string
    name: string
    category: string
    address: string
    maps_link: string | null
    cover_photo_url: string | null
    overall_rating: number | null
    category_ratings: Record<string, number> | null
    ai_review: string | null
    current_session_id: string | null
    created_at: string
}

export interface RestaurantPhoto {
    id: string
    restaurant_id: string
    photo_url: string
    caption: string | null
    created_at: string
}

export interface VotingSession {
    id: string
    restaurant_id: string
    owner_id: string
    visit_date: string | null
    status: SessionStatus
    created_at: string
    closed_at: string | null
}

export interface SessionVoter {
    id: string
    session_id: string
    user_id: string
    has_voted: boolean
    voted_at: string | null
}

export interface Vote {
    id: string
    session_id: string
    user_id: string
    category_id: string
    score: number
    created_at: string
}

// Extended types with relations
export interface RestaurantWithPhotos extends Restaurant {
    photos: RestaurantPhoto[]
}

export interface VotingSessionWithDetails extends VotingSession {
    restaurant: Restaurant
    owner: User
    voters: (SessionVoter & { user: User })[]
    votes?: Vote[]
}

export interface SessionVoterWithUser extends SessionVoter {
    user: User
}
