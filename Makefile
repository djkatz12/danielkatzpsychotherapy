.PHONY: fonts refresh-fonts check

# First run: fetches and locks the exact Google Fonts CSS/files used by the
# original site. Later runs verify the committed local files and update the HTML
# links without contacting Google again.
fonts:
	python3 scripts/fetch_fonts.py

# Deliberately refresh the locked local font assets from Google Fonts.
refresh-fonts:
	ALLOW_FONT_UPDATE=1 python3 scripts/fetch_fonts.py --refresh

check:
	python3 scripts/check_site.py
