export type Paging = {
    current_page: number,
    total_page: number,
    size: number
}

export type WebResponse<T> = {
    message?: string,
    data?: T,
    errors?: string,
    paging?: Paging
}