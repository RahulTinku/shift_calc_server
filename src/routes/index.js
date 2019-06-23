const routes = (express, app, { employee }) => {
	const route = express.Router();

	route.get('/employeeList', employee.getList);
}

module.exports = routes;