from urllib.parse import urlparse
from django.core.cache import cache
from django.conf import settings
from django.apps import apps 

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def get_allowed_frames(self):
        cache_key = 'csp_allowed_frame_origins'
        allowed_origins = cache.get(cache_key)

        if allowed_origins is None:
            allowed_origins = set()
            
            try:
                Dashboards = apps.get_model('app', 'Dashboards')
                
                urls = Dashboards.objects.filter(powerbi_url__isnull=False).exclude(powerbi_url='').values_list('powerbi_url', flat=True)
                
                for url in urls:
                    parsed = urlparse(url)
                    origin = f"{parsed.scheme}://{parsed.netloc}"
                    allowed_origins.add(origin)
            except Exception:
                pass

            metabase_url = getattr(settings, 'METABASE_SITE_URL', None)
            if metabase_url:
                parsed_mb = urlparse(metabase_url)
                origin_mb = f"{parsed_mb.scheme}://{parsed_mb.netloc}"
                allowed_origins.add(origin_mb)

            cache.set(cache_key, allowed_origins, 300)

        return " ".join(allowed_origins)

    def __call__(self, request):
        resp = self.get_response(request)

        frame_src_sources = self.get_allowed_frames()

        resp["Content-Security-Policy"] = (
            "default-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            f"frame-src 'self' {frame_src_sources} data:; "
            "worker-src 'none'; "
            "media-src 'none'; "
            "manifest-src 'self'; "
            "img-src 'self' data:; "
            "font-src 'self' data:; "
            "style-src 'self'; "
            "script-src 'self'; "
            "connect-src 'self'; "
            "script-src-attr 'none'; "
            "upgrade-insecure-requests; "
            "block-all-mixed-content"
        )

        resp["X-Content-Type-Options"] = "nosniff"
        resp["Referrer-Policy"] = "same-origin"
        resp["Cross-Origin-Opener-Policy"] = "same-origin"
        resp["Cross-Origin-Resource-Policy"] = "same-origin"
        resp["Permissions-Policy"] = "clipboard-write=(self)"

        return resp