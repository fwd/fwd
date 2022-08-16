# FWD
function n1() {
  if [ "$1" == 'file' ] && [ "$2" == 'count' ]; then
    echo "File Count: "$(ls /etc | wc -l)
  fi
  if [ "$1" == 'usb' ]; then
    echo "File Count: "$(lsblk -o KNAME,TYPE,SIZE,MODEL)
  fi
}

echo $(n1 $1 $2 $3 $4)
