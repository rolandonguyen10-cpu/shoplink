export default async (request) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed"
      }),
      { status: 405, headers }
    );
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Thiếu cấu hình Supabase trên Netlify"
      }),
      { status: 500, headers }
    );
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/links?select=id,title,url`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Không thể đọc dữ liệu Supabase",
          status: response.status
        }),
        { status: 502, headers }
      );
    }

    const rows = await response.json();
    const links = {};

    for (const row of rows) {
      if (row.title && row.url) {
        links[row.title] = row.url;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        links
      }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Không thể kết nối cơ sở dữ liệu"
      }),
      { status: 500, headers }
    );
  }
};
