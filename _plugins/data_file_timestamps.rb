# Exposes the last-modified time of every file in _data/ as site.data.timestamps,
# and of each page's own source file as page.last_modified.
#
# Lets pages show an accurate "Last updated" date without anyone remembering to
# edit it. Use via the last-updated.html include:
#
#   {% include last-updated.html source="resources" %}   (a data file's date)
#   {% include last-updated.html %}                      (the page's own date)
#
# Note: a fresh CI checkout gives every file the clone time, so the workflow
# restores real commit times before building (see .github/workflows/jekyll.yml).
module FCAI
  class DataFileTimestamps < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      stamps = {}

      Dir.glob(File.join(site.source, "_data", "**", "*.{yml,yaml,json,csv,tsv}")).each do |path|
        key = File.basename(path, File.extname(path))
        stamps[key] = File.mtime(path)
      end

      site.data["timestamps"] = stamps

      site.pages.each do |page|
        path = File.join(site.source, page.relative_path)
        page.data["last_modified"] = File.mtime(path) if File.file?(path)
      end
    end
  end
end
