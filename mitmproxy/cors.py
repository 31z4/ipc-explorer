from mitmproxy import http


def response(flow):
    flow.response.headers["Access-Control-Allow-Origin"] = "*"


def request(flow):
    if flow.request.method == "OPTIONS":
        flow.response = http.Response.make(
            200,
            b"",
            {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
        )
