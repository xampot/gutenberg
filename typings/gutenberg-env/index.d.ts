interface Environment {
	NODE_ENV: unknown;
	FORCE_REDUCED_MOTION: unknown;
}
interface Process {
	env: Environment;
}
declare var process: Process;
