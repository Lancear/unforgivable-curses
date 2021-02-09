Minimalistic POJO Notation

Define a class:
(+|.) <packageName> <className> [= <extendsClassName>]

Define a property:
<AccessLevelGet><AccessLevelSet> <dataType> <propName>

Hashcode & equals:
#= <prop1> [<prop2> ...]

toString:
" <prop1> [<prop2> ...]

AccessLevels:
+ ... public
. ... package/internal/friendly
_ ... protected
- ... private
! ... don't generate (getter/setter)



NOTE:
1. No semantic check, except for the propnames at toString and hashcode & equals!
2. This transpiler does not generate imports if needed!