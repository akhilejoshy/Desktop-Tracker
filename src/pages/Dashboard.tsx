import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardDescription, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useTime } from "../contexts/TimeContext";
import { useMonitoring } from "@/contexts/MonitoringContext";
import { fetchProjectsWithAssignedSubtasks, submitDailyActivity, DailyActivityPayload, fetchDailyActivity, updateWorkingStatus } from "@/store/slices/taskSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";


export default function DashboardPage() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch()
	const { startTimer } = useTime();
	const username = localStorage.getItem('employee')
	const [selectedProjectId, setSelectedProjectId] = useState<string>();
	const [selectedTaskId, setSelectedTaskId] = useState<string>();
	const [selectedSubtaskId, setSelectedSubtaskId] = useState<string>();
	const [description, setDescription] = useState("");
	const { projectsData, submissionLoading, submissionError, isPunchedIn, dailyPunchInTime, workDiary } = useAppSelector((state) => state.task)
	useEffect(() => {
		dispatch(fetchProjectsWithAssignedSubtasks())
		setTimeout(() => {
			dispatch(fetchDailyActivity()).unwrap()
		}, 500);
	}, [dispatch])

	const allSubtasks = useMemo(() => {
		if (!projectsData || projectsData.length === 0) return [];
		return projectsData.flatMap((project) =>
			(project.tasks ?? []).flatMap((task) =>
				(task.subtasks ?? []).map((subtask) => ({
					...subtask,
					taskId: task.id,
					taskName: task.name,
					projectId: project.id,
					projectName: project.project_name,
				}))
			)
		);
	}, [projectsData]);

	const filteredTasks = useMemo(() => {
		if (!selectedProjectId) return [];
		const project = projectsData?.find((p) => p.id === Number(selectedProjectId));
		return project ? project.tasks : [];
	}, [projectsData, selectedProjectId]);

	const filteredSubtasks = useMemo(() => {
		if (!projectsData || !selectedTaskId) return [];
		const taskId = Number(selectedTaskId);
		const project = projectsData.find((p) =>
			p.tasks?.some((t) => t.id === taskId)
		);
		const task = project?.tasks.find((t) => t.id === Number(selectedTaskId));
		if (!task || task.assigned_task <= 0) return [];
		return task?.subtasks ?? [];
	}, [projectsData, selectedTaskId]);

	const selectedSubtask = useMemo(() => {
		if (!selectedSubtaskId) return null;
		return allSubtasks.find((st) => st.id === Number(selectedSubtaskId));
	}, [allSubtasks, selectedSubtaskId]);

	const { startMonitoring } = useMonitoring();
	const handleStart = async () => {
		if (!selectedSubtaskId || !selectedSubtask) return;
		const now = new Date();
		const dateFormatted = now.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata', hour12: false }).replace(' ', 'T') + "+05:30";
		const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
		const activityData = {
			sub_task_id: Number(selectedSubtaskId),
			start_time: timeFormatted,
			description: description || selectedSubtask.description || "",
		};
		let payload: DailyActivityPayload;
		payload = {
			punch_in: timeFormatted,
			date: dateFormatted,
			task_activities: [activityData],
		};
		const formData = new FormData()
		formData.append("data", JSON.stringify(payload))
		let taskActivityId: string | undefined;
		let workDiaryID: string | undefined;

		try {
			const response = await dispatch(submitDailyActivity(formData)).unwrap();
			workDiaryID = response?.response?.data?.task_activities[0]?.work_diary_id
			taskActivityId = response?.response?.data?.task_activities[0]?.id
			await dispatch(
				updateWorkingStatus({
					workingStatus: true,
					subtaskId: Number(selectedSubtaskId),
				})
			).unwrap();
		} catch (err) {
			return;
		}
		const intervel = localStorage.getItem('activity_period')
		if (workDiaryID && taskActivityId && intervel) {
			startTimer(selectedSubtaskId);
			navigate(`/work-session/${selectedSubtaskId}/${workDiaryID}/${taskActivityId}`);
			startMonitoring(Number(intervel), selectedSubtaskId, Number(workDiaryID), Number(taskActivityId));
		} else {
			console.warn("No taskActivityId found; skipping monitoring");
		}

	};
	const hasSubtasks = filteredSubtasks && filteredSubtasks.length > 0;
	const hasProjects = projectsData && projectsData.length > 0;
	const hasTasks = filteredTasks && filteredTasks.length > 0;
	const truncate = (text: string, maxLength = 18) =>
		text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

	return (
		<div className="space-y-6 flex flex-col h-full ">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Hi, {username}</h2>
			</div>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="project-select">Projects</Label>
					<Select
						value={selectedProjectId?.toString()}
						onValueChange={(value) => {
							setSelectedProjectId(value);
							setSelectedTaskId(undefined);
							setSelectedSubtaskId(undefined);
						}}
						disabled={!hasProjects}
					>
						<SelectTrigger id="project-select" className="border-0 shadow-sm shadow-black/60 rounded-md">
							<SelectValue
								placeholder={
									hasProjects ? "Select a project" : "No projects available"
								}
							/>
						</SelectTrigger>
						{hasProjects && (
							<SelectContent className="border-0 shadow-lg shadow-black/60 rounded-md max-h-45 max-w-[90vw] overflow-y-auto">
								{projectsData
									.map((project) => (
										<SelectItem
											key={project.id}
											value={project.id.toString()}
										>
											{project.project_name} (
											{project.assigend_task}{" "}
											task)
										</SelectItem>
									))}
							</SelectContent>
						)}
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="task-select">Tasks</Label>
					<Select
						value={selectedTaskId?.toString()}
						onValueChange={(value) => {
							setSelectedTaskId(value);
							setSelectedSubtaskId(undefined);
						}}
						disabled={!hasTasks}
					>
						<SelectTrigger id="task-select" className="border-0 shadow-sm shadow-black/60 rounded-md">
							<SelectValue placeholder="Select a task" />
						</SelectTrigger>
						{hasTasks && (
							<SelectContent className="border-0 shadow-lg shadow-black/60 rounded-md max-h-45 max-w-[90vw] overflow-y-auto">
								{filteredTasks
									.map((task) => (
										<SelectItem key={task.id} value={task.id.toString()} >
											{task.name} ({task.assigned_task} subtask)
										</SelectItem>
									))}
							</SelectContent>
						)}
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="subtask-select">Subtasks</Label>
					<Select
						value={selectedSubtaskId?.toString()}
						onValueChange={(value) => setSelectedSubtaskId(value)}
						disabled={!hasSubtasks}
					>
						<SelectTrigger id="subtask-select" className="border-0 shadow-sm shadow-black/60 rounded-md">
							<SelectValue placeholder="Select a subtask" />
						</SelectTrigger>
						{hasSubtasks && (
							<SelectContent className="border-0 shadow-lg shadow-black/60 rounded-md max-h-45 max-w-[90vw] overflow-y-auto">
								{filteredSubtasks.map((subtask) => (
									<SelectItem key={subtask.id} value={subtask.id.toString()}>
										{subtask.name}
									</SelectItem>
								))}
							</SelectContent>
						)}
					</Select>
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Work Note Entry</Label>
				<Textarea
					id="description"
					placeholder={
						selectedSubtask
							? selectedSubtask.description
							: "Add a description of your work..."
					}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className=" border-0 shadow-sm shadow-black/80 rounded-md"
					disabled={!selectedSubtask}
				/>
			</div>

			<Button
				className="w-full bg-blue-600 hover:bg-blue-800 text-accent-foreground"
				onClick={handleStart}
				disabled={!selectedSubtaskId || submissionLoading}
			>
				{submissionLoading && !isPunchedIn ? (
					<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Work Starting...</>
				) : (
					'Start Work'
				)}
			</Button>
			<hr />
			<div className="space-y-2">
				<h5 className="text-xl font-bold">Daily Work History</h5>
				{workDiary && Array.isArray(workDiary.task_activities) && workDiary.task_activities.length > 0 ? (
					<TooltipProvider>
						<div className="flex flex-wrap gap-2">
							{workDiary.task_activities.map((taskActivity) => (
								<Tooltip key={taskActivity.id}>
									<TooltipTrigger asChild>
										<Badge
											variant="secondary"
											className="cursor-pointer px-2 py-0.5 text-xs bg-blue-600! hover:bg-blue-800/70!"
											onClick={async () => {
												if (
													localStorage.getItem("activity_period") &&
													taskActivity.sub_task_id &&
													taskActivity.work_diary_id
												) {
													try {
														await dispatch(
															updateWorkingStatus({
																workingStatus: true,
																subtaskId: taskActivity.sub_task_id,
															})
														).unwrap();
														startTimer(taskActivity.id.toString());
														startMonitoring(
															Number(localStorage.getItem("activity_period")),
															taskActivity.sub_task_id.toString(),
															taskActivity.work_diary_id,
															taskActivity.id
														);
														navigate(
															`/work-session/${taskActivity.sub_task_id}/${taskActivity.work_diary_id}/${taskActivity.id}`
														);
													} catch (err) {
														return;
													}
												}
											}}

										>
											{truncate(taskActivity.subtask_name)} - {taskActivity.total_time_spent}
										</Badge>
									</TooltipTrigger>

									<TooltipContent side="top" align="center" collisionPadding={8} className="border-0 shadow-lg shadow-black/60 rounded-md ">
										<p className="max-w-[85vw] break-words text-center">
											{taskActivity.subtask_name}
										</p>
									</TooltipContent>
								</Tooltip>
							))}
						</div>
					</TooltipProvider>


				) : (
					<div className="flex-1 flex items-center justify-center text-center">
						<Card className="p-6 border-dashed">
							<CardHeader>
								<CardTitle>No Activity Yet</CardTitle>
								<CardDescription>You haven't tracked any work yet. Select a subtask to get started.</CardDescription>
							</CardHeader>
						</Card>
					</div>
				)}
			</div>

		</div>
	);
}
