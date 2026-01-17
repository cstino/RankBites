declare module 'open-location-code' {
    interface CodeArea {
        latitudeCenter: number
        longitudeCenter: number
        latitudeLo: number
        latitudeHi: number
        longitudeLo: number
        longitudeHi: number
        codeLength: number
    }

    function decode(code: string): CodeArea
    function encode(latitude: number, longitude: number, codeLength?: number): string
    function isFull(code: string): boolean
    function isShort(code: string): boolean
    function isValid(code: string): boolean

    export { decode, encode, isFull, isShort, isValid, CodeArea }
    export default { decode, encode, isFull, isShort, isValid }
}
