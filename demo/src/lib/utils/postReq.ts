export default function postReq(url: string, data: any): Promise<{success: boolean, result: any}> {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(async (res) => {
                console.log(res)
                if (res.status >= 400 && res.status < 600) {
                    resolve({
                        success: false,
                        result: await res.json()
                    });
                } else {
                    resolve({
                        success: true,
                        result: await res.json()
                    });
                }
            })
            .catch((e) => {
                console.log(e)
                reject(e)
            });
    })
}