import logging
import mkdocs.plugins

log = logging.getLogger('mkdocs')

@mkdocs.plugins.event_priority(-50)

def on_page_content(html, page, config, files):

    # get redirect config
    redirect_plugin = config.get('plugins', {}).get('redirects')
    redirects = redirect_plugin.config.get('redirect_maps',{})

    if "context_id" in page.meta:
        context_id = page.meta.get("context_id")
        key = f"{context_id}.md"
        if key in redirects:
            log_context_id_warning(page.meta.context_id, page.file.src_path, redirects[key])
        redirects[key] = page.file.src_path

    for item in page.toc.items:
        # maybe implement check for UUID or something else
        if item.id.isdigit():
            key = f"{item.id}.md"
            if key in redirects:
                log_context_id_warning(item.id, page.file.src_path, redirects[key])
            redirects[key] = f"{page.file.src_path}{item.url}"

def log_context_id_warning(context_id, markdown1,  markdown2):
    log.warning(f"Context ID {context_id} used in {markdown1} and {markdown2}")
