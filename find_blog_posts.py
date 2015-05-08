#!/usr/bin/python
# Copyright 2011 Muthu Kannan. All Rights Reserved.
#
# Script that searches for a string in a Blogger export XML file.

import getopt
import re
import sys
from xml.dom import minidom


BLOGGER_HOST = 'draft.blogger.com'


def _IsPost(entry):
  for category in entry.getElementsByTagName('category'):
    scheme = category.getAttribute('scheme')
    term = category.getAttribute('term')
    if (scheme == 'http://schemas.google.com/g/2005#kind' and
        term == 'http://schemas.google.com/blogger/2008/kind#post'):
      return True
  return False


def FindPostsWithString(xml_doc, search_string):
  ids = []
  for entry in xml_doc.getElementsByTagName('entry'):
    all_ids = entry.getElementsByTagName('id')
    if len(all_ids) != 1:
      print >>sys.stderr, 'Ignoring entry with %d ids.' % len(all_ids)
      continue
    entry_id = all_ids[0].childNodes[0].data
    if not re.match('^tag:blogger.com,1999:blog-\\d+.post-\\d+$', entry_id):
      continue
    if not _IsPost(entry):
      continue
    all_contents = entry.getElementsByTagName('content')
    if len(all_contents) != 1:
      print >>sys.stderr, 'Ignoring entry with %d contents.' % len(all_contents)
      continue
    if search_string in all_contents[0].childNodes[0].data:
      ids.append(entry_id)

  return map(ParsePostIdString, ids)


def ParsePostIdString(id_str):
  match = re.match('tag:blogger.com,1999:blog-(\\d+).post-(\\d+)', id_str)
  return {'blog_id': match.group(1), 'post_id': match.group(2)}


def GetEditPostLink(post_info):
  return 'http://%s/post-edit.g?blogID=%s&postID=%s' % (
      BLOGGER_HOST, post_info['blog_id'], post_info['post_id'])


def main():
  optlist, unused_args = getopt.gnu_getopt(sys.argv[1:],
                                           'b:s:', ('blog=', 'search='))
  if len(optlist) != 2:
    print >>sys.stderr, '%s -b blog_xml_file -s search_string' % sys.argv[0]
    return

  for opt, value in optlist:
    if opt in ('-b', '--blog'):
      blogger_xml_file = value
    elif opt in ('-s', '--search'):
      search_string = value

  post_ids = FindPostsWithString(minidom.parse(blogger_xml_file), search_string)
  print '\n'.join(map(GetEditPostLink, post_ids))


if __name__ == '__main__':
  main()
