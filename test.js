import axios from "axios";
import curlirize from 'axios-curlirize';
curlirize(axios);

(async () => {
    await axios.get("https://httpbin.io/ip", {
        proxy: {
            protocol: 'http',
            host: 'squid',
            port: 3128
        }
    }).then((res) => console.log(res.data));
})();