.PHONY: fonts

# Fetches the exact Google Fonts CSS/files used by the original site, rewrites
# the @font-face URLs to local files, and updates the HTML to use them.
fonts:
	python3 scripts/fetch_fonts.py
