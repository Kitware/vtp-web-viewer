"""Helper script to inject data into the built HTML file."""
import base64
import os
import sys


def add_data_to_viewer(data_path, src_html_path):
    if os.path.isfile(data_path) and os.path.exists(src_html_path):
        dstDir = os.path.dirname(data_path)
        dstHtmlPath = os.path.join(dstDir, '%s.html' % os.path.splitext(os.path.basename(data_path))[0])

        # Extract data as base64
        with open(data_path, 'rb') as data:
            dataContent = data.read()
            base64Content = base64.b64encode(dataContent)
            base64Content = base64Content.decode().replace('\n', '')

        # Create new output file
        with open(src_html_path, mode='r', encoding="utf-8") as srcHtml:
            with open(dstHtmlPath, mode='w', encoding="utf-8") as dstHtml:
                src = srcHtml.read()
                dist = src.replace('this_is_the_content', base64Content)
                dstHtml.write(dist)


if __name__ == "__main__":
    file_name = sys.argv[1]
    src_html_path = sys.argv[2]
    add_data_to_viewer(file_name, src_html_path)
