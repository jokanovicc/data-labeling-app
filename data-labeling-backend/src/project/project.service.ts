import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/model/user.model';
import { UserService } from 'src/user/user.service';
import { ProjectMetadataDTO } from './DTO/ProjectMetadata.dto';
import { ProjectTemplateDTO } from './DTO/ProjectTemplate.dto';
import { OutputData } from './models/dataAccepting.model';
import { Metadata, MetadataDocument } from './models/metamodel.model';
import { Project, ProjectDocument } from './models/project.model';
import { Resource } from './models/resource.model';
import { UserAndTheirLastResource } from './models/userLastResource.model';
import { ResourceService } from './resource.service';

@Injectable()
export class ProjectService {

    constructor(
        @InjectModel("project") private readonly projectModel: Model<ProjectDocument>,
        private readonly userService: UserService,
        private readonly resourceService: ResourceService

    ) { }


    async createProject(project: Project): Promise<Project> {
        const newProject = new this.projectModel(project);
        return newProject.save();

    }

    async getAllProjects() {
        const projects = <Project[]>await this.projectModel.find({}).lean().exec();
        return projects;

    }

    async findProject(id) {
        const project = <Project>await this.projectModel.findOne({ identNumber: id }).lean().exec();
        if (!project) {
            throw new NotFoundException("Could not find project!")
        }
        return project;
    }

    async findByUser(id): Promise<Project[]> {

        const ObjectId = require('mongodb').ObjectId;
        const projectList = <Project[]>await this.projectModel.find({
            "users": ObjectId(id)
        }).lean().exec();

        return projectList;
    }


    async updateProject(id, data): Promise<Project> {
        return await this.projectModel.findOneAndUpdate({ identNumber: id }, data, { new: true })
    }


    async createUserLastResource(ordinalNumber: number, project: Project, user: User) {

        let userAndTheirLastResource = new UserAndTheirLastResource();
        userAndTheirLastResource.ordinalNumber = ordinalNumber;
        userAndTheirLastResource.userId = user._id.toString();
        project.userAndTheirLastResource.push(userAndTheirLastResource);
        const updatedProject = await this.updateProject(project.identNumber, project);
        console.log(updatedProject);

    }

    async findIfExist(resource: Resource, project: Project, user: User) {

        for (const labeled of project.userAndTheirLastResource) {
            if (labeled.ordinalNumber + 1 == resource.ordinalNumber && labeled.userId == user._id.toString()) {
                return labeled;
            } else {
                return null;
            }
        }

    }

    async createProjectFromTemplate(projectTemplate: ProjectTemplateDTO){
        let project = new Project();
        project.title = projectTemplate.title;
        project.description = projectTemplate.description;
        project.identNumber = projectTemplate.identNumber;
        project.users = [];
        for (const userId of projectTemplate.users) {
          let user = await this.userService.findUser(userId);
          console.log(user);
          project.users.push(user);
    
        }
        this.createProject(project);

    }


    async getProjectByUsers(projects: Project[]){
        let result = [];
        for(const p of projects){
          let resourceNumberTotal = await this.resourceService.findByProject(p._id);
          if(p.userAndTheirLastResource.length ==0){
            result.push(p);
          }else{
          for(const r of p.userAndTheirLastResource){
            if(r.ordinalNumber < resourceNumberTotal.length){
              result.push(p);
            }
          }
        }
    
        }

        console.log(result);
        return result;

    }


    async acceptLabeledData(resource: Resource, project:Project, user:User,body: ProjectMetadataDTO){
            
    if (resource.outputFields.length == 0) {
        resource.outputFields = [];
      }
  
      for (const b of body.fields) {
        let outputFields = new OutputData();
        outputFields.name = b.name;
        outputFields.type = b.type;
        outputFields.value = b.value;
        if(outputFields.value == null){
          outputFields.value = false;
        }
        resource.outputFields.push(outputFields);
      }
  
      const updated = await this.resourceService.updateResource(resource._id, resource);
      let labeled = await this.findIfExist(resource, project, user);
  
      if (labeled == null) {
        this.createUserLastResource(resource.ordinalNumber, project, user);
  
      } else {
        labeled.ordinalNumber++;
        const updatedProject = await this.updateProject(project.identNumber, project);
        console.log(updatedProject.userAndTheirLastResource.length);
      }
    }
    }



