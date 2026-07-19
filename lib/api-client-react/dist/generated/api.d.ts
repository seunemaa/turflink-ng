import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AvailabilityResponse, Booking, BookingInput, BookingsSummary, ErrorResponse, GetWeatherParams, HealthStatus, MembershipInput, MembershipStatus, Pitch, User, WeatherData } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPitchesUrl: () => string;
/**
 * @summary List all pitches
 */
export declare const listPitches: (options?: RequestInit) => Promise<Pitch[]>;
export declare const getListPitchesQueryKey: () => readonly ["/api/pitches"];
export declare const getListPitchesQueryOptions: <TData = Awaited<ReturnType<typeof listPitches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPitches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPitches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPitchesQueryResult = NonNullable<Awaited<ReturnType<typeof listPitches>>>;
export type ListPitchesQueryError = ErrorType<unknown>;
/**
 * @summary List all pitches
 */
export declare function useListPitches<TData = Awaited<ReturnType<typeof listPitches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPitches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPitchUrl: (id: number) => string;
/**
 * @summary Get a pitch by ID
 */
export declare const getPitch: (id: number, options?: RequestInit) => Promise<Pitch>;
export declare const getGetPitchQueryKey: (id: number) => readonly [`/api/pitches/${number}`];
export declare const getGetPitchQueryOptions: <TData = Awaited<ReturnType<typeof getPitch>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPitch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPitch>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPitchQueryResult = NonNullable<Awaited<ReturnType<typeof getPitch>>>;
export type GetPitchQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a pitch by ID
 */
export declare function useGetPitch<TData = Awaited<ReturnType<typeof getPitch>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPitch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCheckAvailabilityUrl: (id: number, date: string) => string;
/**
 * @summary Get available time slots for a pitch on a given date
 */
export declare const checkAvailability: (id: number, date: string, options?: RequestInit) => Promise<AvailabilityResponse>;
export declare const getCheckAvailabilityQueryKey: (id: number, date: string) => readonly [`/api/pitches/${number}/availability/${string}`];
export declare const getCheckAvailabilityQueryOptions: <TData = Awaited<ReturnType<typeof checkAvailability>>, TError = ErrorType<unknown>>(id: number, date: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof checkAvailability>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof checkAvailability>>, TError, TData> & {
    queryKey: QueryKey;
};
export type CheckAvailabilityQueryResult = NonNullable<Awaited<ReturnType<typeof checkAvailability>>>;
export type CheckAvailabilityQueryError = ErrorType<unknown>;
/**
 * @summary Get available time slots for a pitch on a given date
 */
export declare function useCheckAvailability<TData = Awaited<ReturnType<typeof checkAvailability>>, TError = ErrorType<unknown>>(id: number, date: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof checkAvailability>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBookingUrl: () => string;
/**
 * @summary Create a new booking
 */
export declare const createBooking: (bookingInput: BookingInput, options?: RequestInit) => Promise<Booking>;
export declare const getCreateBookingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
        data: BodyType<BookingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
    data: BodyType<BookingInput>;
}, TContext>;
export type CreateBookingMutationResult = NonNullable<Awaited<ReturnType<typeof createBooking>>>;
export type CreateBookingMutationBody = BodyType<BookingInput>;
export type CreateBookingMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new booking
*/
export declare const useCreateBooking: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
        data: BodyType<BookingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBooking>>, TError, {
    data: BodyType<BookingInput>;
}, TContext>;
export declare const getGetMyBookingsUrl: () => string;
/**
 * @summary Get bookings for the authenticated user
 */
export declare const getMyBookings: (options?: RequestInit) => Promise<Booking[]>;
export declare const getGetMyBookingsQueryKey: () => readonly ["/api/bookings/my"];
export declare const getGetMyBookingsQueryOptions: <TData = Awaited<ReturnType<typeof getMyBookings>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyBookings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyBookingsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyBookings>>>;
export type GetMyBookingsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get bookings for the authenticated user
 */
export declare function useGetMyBookings<TData = Awaited<ReturnType<typeof getMyBookings>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBookingByReferenceUrl: (reference: string) => string;
/**
 * @summary Get a booking by reference number
 */
export declare const getBookingByReference: (reference: string, options?: RequestInit) => Promise<Booking>;
export declare const getGetBookingByReferenceQueryKey: (reference: string) => readonly [`/api/bookings/${string}`];
export declare const getGetBookingByReferenceQueryOptions: <TData = Awaited<ReturnType<typeof getBookingByReference>>, TError = ErrorType<ErrorResponse>>(reference: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookingByReference>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBookingByReference>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBookingByReferenceQueryResult = NonNullable<Awaited<ReturnType<typeof getBookingByReference>>>;
export type GetBookingByReferenceQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a booking by reference number
 */
export declare function useGetBookingByReference<TData = Awaited<ReturnType<typeof getBookingByReference>>, TError = ErrorType<ErrorResponse>>(reference: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookingByReference>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBookingsSummaryUrl: () => string;
/**
 * @summary Get booking statistics summary
 */
export declare const getBookingsSummary: (options?: RequestInit) => Promise<BookingsSummary>;
export declare const getGetBookingsSummaryQueryKey: () => readonly ["/api/bookings/summary"];
export declare const getGetBookingsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getBookingsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookingsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBookingsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBookingsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getBookingsSummary>>>;
export type GetBookingsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get booking statistics summary
 */
export declare function useGetBookingsSummary<TData = Awaited<ReturnType<typeof getBookingsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookingsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeUrl: () => string;
/**
 * @summary Get the currently authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the currently authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMembershipUrl: () => string;
/**
 * @summary Get membership status for the authenticated user
 */
export declare const getMembership: (options?: RequestInit) => Promise<MembershipStatus>;
export declare const getGetMembershipQueryKey: () => readonly ["/api/membership"];
export declare const getGetMembershipQueryOptions: <TData = Awaited<ReturnType<typeof getMembership>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMembership>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMembership>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMembershipQueryResult = NonNullable<Awaited<ReturnType<typeof getMembership>>>;
export type GetMembershipQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get membership status for the authenticated user
 */
export declare function useGetMembership<TData = Awaited<ReturnType<typeof getMembership>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMembership>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSignUpMembershipUrl: () => string;
/**
 * @summary Sign up for seun.emaa Pro membership
 */
export declare const signUpMembership: (membershipInput: MembershipInput, options?: RequestInit) => Promise<MembershipStatus>;
export declare const getSignUpMembershipMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof signUpMembership>>, TError, {
        data: BodyType<MembershipInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof signUpMembership>>, TError, {
    data: BodyType<MembershipInput>;
}, TContext>;
export type SignUpMembershipMutationResult = NonNullable<Awaited<ReturnType<typeof signUpMembership>>>;
export type SignUpMembershipMutationBody = BodyType<MembershipInput>;
export type SignUpMembershipMutationError = ErrorType<ErrorResponse>;
/**
* @summary Sign up for seun.emaa Pro membership
*/
export declare const useSignUpMembership: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof signUpMembership>>, TError, {
        data: BodyType<MembershipInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof signUpMembership>>, TError, {
    data: BodyType<MembershipInput>;
}, TContext>;
export declare const getGetWeatherUrl: (params?: GetWeatherParams) => string;
/**
 * @summary Get current weather for a city
 */
export declare const getWeather: (params?: GetWeatherParams, options?: RequestInit) => Promise<WeatherData>;
export declare const getGetWeatherQueryKey: (params?: GetWeatherParams) => readonly ["/api/weather", ...GetWeatherParams[]];
export declare const getGetWeatherQueryOptions: <TData = Awaited<ReturnType<typeof getWeather>>, TError = ErrorType<unknown>>(params?: GetWeatherParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeather>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWeather>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWeatherQueryResult = NonNullable<Awaited<ReturnType<typeof getWeather>>>;
export type GetWeatherQueryError = ErrorType<unknown>;
/**
 * @summary Get current weather for a city
 */
export declare function useGetWeather<TData = Awaited<ReturnType<typeof getWeather>>, TError = ErrorType<unknown>>(params?: GetWeatherParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeather>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map