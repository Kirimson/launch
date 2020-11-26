export class Helper {
    /**
     * Checks if text contains http, if not, prepend it
     * @param text text to check
     */
    public static ensureHttp(text:string):string{
        let pattern = /(http(s)?:\/\/.).*/g
        if(text.match(pattern)){
            return text;
        }
        return 'http://'+text;
    }
}