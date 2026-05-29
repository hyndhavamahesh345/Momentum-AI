import { getToken } from '@auth/core/jwt';
export async function GET(request) {
	const isSecure = process.env.AUTH_URL?.startsWith('https') ?? request.url?.startsWith('https') ?? false;
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: isSecure,
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: isSecure,
		}),
	]);

	if (!jwt) {
		return new Response(
			`
			<html>
				<body>
					<script>
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, '*');
					</script>
				</body>
			</html>
			`,
			{
				status: 401,
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}

	const message = {
		type: 'AUTH_SUCCESS',
		jwt: token,
		user: {
			id: jwt.sub,
			email: jwt.email,
			name: jwt.name,
		},
	};

	return new Response(
		`
		<html>
			<body>
				<script>
					window.parent.postMessage(${JSON.stringify(message)}, '*');
				</script>
			</body>
		</html>
		`,
		{
			headers: {
				'Content-Type': 'text/html',
			},
		}
	);
}


// Auto-appended to fix React Router v7 static analysis
export async function loader({ request, params }) {
  if (typeof GET !== 'undefined') return GET(request, { params });
  return new Response("Method Not Allowed", { status: 405 });
}
export async function action({ request, params }) {
  const method = request.method;
  if (method === "POST" && typeof POST !== 'undefined') return POST(request, { params });
  if (method === "PUT" && typeof PUT !== 'undefined') return PUT(request, { params });
  if (method === "PATCH" && typeof PATCH !== 'undefined') return PATCH(request, { params });
  if (method === "DELETE" && typeof DELETE !== 'undefined') return DELETE(request, { params });
  return new Response("Method Not Allowed", { status: 405 });
}
