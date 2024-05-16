specifier=$1

echo "==> Checking out $specifier..."
git checkout $specifier

echo "==> Cleaning working directory..." 
git clean -xdf
echo "Done"