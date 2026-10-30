"""Authoring helper: exempt the native E-card subtree from content CSS.
Requires tinycss2. Safe to rerun; extension users do not need Python.
"""
from pathlib import Path
import json,re,tinycss2
root=Path(__file__).resolve().parents[1]
suffix=':not(:where(.cp-original-ecard,.cp-original-ecard *))'
def selector(tokens):
 parts=[];current=[]
 for token in tokens:
  if token.type=='literal' and token.value==',':parts.append(tinycss2.serialize(current));current=[]
  else:current.append(token)
 parts.append(tinycss2.serialize(current));result=[]
 for part in parts:
  if suffix in part:result.append(part);continue
  clean=part.rstrip();tail=part[len(clean):]
  match=re.search(r'(::[\w-]+(?:\([^)]*\))?)$',clean)
  if match:clean=clean[:match.start()]+suffix+match.group(0)
  else:clean+=suffix
  result.append(clean+tail)
 return ','.join(result)
def rules(items):
 for item in items:
  if item.type=='qualified-rule':item.prelude=tinycss2.parse_component_value_list(selector(item.prelude))
  elif item.type=='at-rule' and item.content and item.lower_at_keyword in ('media','supports','layer','container'):
   nested=tinycss2.parse_rule_list(item.content,skip_comments=False,skip_whitespace=False);rules(nested);item.content=tinycss2.parse_component_value_list(tinycss2.serialize(nested))
manifest=json.loads((root/'extension/manifest.json').read_text())
for entry in manifest['content_scripts']:
 for name in entry.get('css',[]):
  path=root/'extension'/name;sheet=tinycss2.parse_stylesheet(path.read_text(),skip_comments=False,skip_whitespace=False);rules(sheet);path.write_text(tinycss2.serialize(sheet))
