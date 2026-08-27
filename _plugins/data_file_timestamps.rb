# Exposes the last-modified time of every file in _data/ as site.data.timestamps.
#
# Lets pages show an accurate "Last updated" date without anyone remembering to
# edit it. Use via the last-updated.html include:
#
#   {% include last-updated.html source="resources" %}
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
    end
  end
end
